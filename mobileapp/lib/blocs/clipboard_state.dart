part of 'clipboard_bloc.dart';

abstract class ClipboardState extends Equatable {
  @override
  List<Object?> get props => [];
}

class ClipboardInitial extends ClipboardState {}

class ClipboardLoading extends ClipboardState {
  final List<dynamic> oldClipboards;
  ClipboardLoading(this.oldClipboards);
  @override
  List<Object?> get props => [oldClipboards];
}

class ClipboardLoaded extends ClipboardState {
  final List<dynamic> clipboards;
  final bool hasMore;
  ClipboardLoaded(this.clipboards, this.hasMore);
  @override
  List<Object?> get props => [clipboards, hasMore];
}

class ClipboardError extends ClipboardState {
  final String error;
  final List<dynamic> oldClipboards;
  ClipboardError(this.error, this.oldClipboards);
  @override
  List<Object?> get props => [error, oldClipboards];
}
