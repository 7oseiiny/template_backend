import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import '../data/api_service.dart';
import '../notifications/notification_service.dart';

part 'clipboard_event.dart';
part 'clipboard_state.dart';

class ClipboardBloc extends Bloc<ClipboardEvent, ClipboardState> {
  final ApiService apiService;
  ClipboardBloc(this.apiService) : super(ClipboardInitial()) {
    on<FetchClipboards>(_onFetchClipboards);
  }

  int skip = 0;
  final int limit = 5;
  bool hasMore = true;
  List<dynamic> allClipboards = [];

  Future<void> _onFetchClipboards(
    FetchClipboards event,
    Emitter<ClipboardState> emit,
  ) async {
    if (!hasMore && !event.refresh) return;
    if (event.refresh) {
      skip = 0;
      hasMore = true;
      allClipboards.clear();
    }
    emit(ClipboardLoading(allClipboards));
    try {
      final response = await apiService.get(
        'clipboard?skip=$skip&limit=$limit',
      );
      final data = response.data['data'] as List<dynamic>;
      final total = response.data['total'] as int?;
      if (event.refresh) allClipboards.clear();
      // تحقق من وجود عنصر جديد
      bool isNew = false;
      if (data.isNotEmpty &&
          (allClipboards.isEmpty ||
              data.first['id'] != allClipboards.first['id'])) {
        isNew = true;
      }
      allClipboards.addAll(data);
      skip += limit;
      if (total != null && allClipboards.length >= total) hasMore = false;
      emit(ClipboardLoaded(List.from(allClipboards), hasMore));
      // إشعار عند إضافة نص جديد
      if (isNew) {
        final first = data.first;
        NotificationService.showLocalNotification(
          'تمت إضافة نص جديد',
          first['content'] ?? '',
        );
      }
    } catch (e) {
      emit(ClipboardError(e.toString(), List.from(allClipboards)));
    }
  }
}
