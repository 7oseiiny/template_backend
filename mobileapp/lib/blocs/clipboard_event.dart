part of 'clipboard_bloc.dart';

abstract class ClipboardEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class FetchClipboards extends ClipboardEvent {
  final bool refresh;
  FetchClipboards({this.refresh = false});
  @override
  List<Object?> get props => [refresh];
}
