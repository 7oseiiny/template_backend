import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/clipboard_bloc.dart';
import '../data/api_service.dart';
import '../notifications/notification_socket_service.dart';

class HomeScreen extends StatelessWidget {
  final ApiService apiService;
  final String? userId;
  const HomeScreen({super.key, required this.apiService, this.userId});

  @override
  Widget build(BuildContext context) {
    // تفعيل السوكيت عند الدخول للصفحة الرئيسية
    if (userId != null) {
      NotificationSocketService().connect(
        userId: userId!,
        serverUrl: 'http://192.168.1.12:3000', // عدل الرابط حسب الباك اند
      );
    }

    return BlocProvider(
      create: (_) => ClipboardBloc(apiService)..add(FetchClipboards()),
      child: const ClipboardListView(),
    );
  }
}

class ClipboardListView extends StatefulWidget {
  const ClipboardListView({super.key});

  @override
  State<ClipboardListView> createState() => _ClipboardListViewState();
}

class _ClipboardListViewState extends State<ClipboardListView> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      final bloc = context.read<ClipboardBloc>();
      final state = bloc.state;
      if (state is ClipboardLoaded && state.hasMore) {
        bloc.add(FetchClipboards());
      }
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Clipboard List')),
      body: BlocBuilder<ClipboardBloc, ClipboardState>(
        builder: (context, state) {
          List<dynamic> items = [];
          bool isLoading = false;
          bool hasMore = true;
          if (state is ClipboardLoading) {
            items = state.oldClipboards;
            isLoading = true;
          } else if (state is ClipboardLoaded) {
            items = state.clipboards;
            hasMore = state.hasMore;
          } else if (state is ClipboardError) {
            items = state.oldClipboards;
            isLoading = false;
            hasMore = true;
          }
          return RefreshIndicator(
            onRefresh: () async {
              context.read<ClipboardBloc>().add(FetchClipboards(refresh: true));
            },
            child: ListView.builder(
              controller: _scrollController,
              itemCount: items.length + (isLoading || hasMore ? 1 : 0),
              itemBuilder: (context, index) {
                if (index < items.length) {
                  final item = items[index];
                  return Card(
                    margin: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: ListTile(
                      leading: const Icon(
                        Icons.content_copy,
                        color: Colors.deepPurple,
                      ),
                      title: Text(
                        item['content'] ?? '',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      subtitle: Text(item['createdAt'] ?? ''),
                      trailing: Text(item['type'] ?? ''),
                    ),
                  );
                } else {
                  return const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Center(child: CircularProgressIndicator()),
                  );
                }
              },
            ),
          );
        },
      ),
    );
  }
}
