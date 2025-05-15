import 'package:bloc/bloc.dart';
// import 'package:equatable/equatable.dart'; // تم التعليق لأنه غير مستخدم
import '../data/api_service.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final ApiService apiService;
  String? token;

  AuthBloc(this.apiService) : super(AuthInitial()) {
    on<LoginEvent>(_onLogin);
    on<RegisterEvent>(_onRegister);
  }

  Future<void> _onLogin(LoginEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final response = await apiService.post('auth/login', {
        'ref': event.email,
        'password': event.password,
      });
      // حفظ التوكن بعد تسجيل الدخول
      final token = response.data['token'] ?? response.data['accessToken'];
      apiService.setToken(token);
      final userId =
          response.data['user']?['id']?.toString() ??
          response.data['user']?['_id']?.toString() ??
          response.data['userId']?.toString() ??
          '';
      emit(AuthSuccess(userId));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onRegister(RegisterEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final response = await apiService.post('auth/register', {
        'name': event.name,
        'email': event.email,
        'password': event.password,
        'number': event.number,
        'userName': event.userName,
        'roleName': 'user',
      });
      final userId =
          response.data['user']?['id']?.toString() ??
          response.data['user']?['_id']?.toString() ??
          response.data['userId']?.toString() ??
          '';
      emit(AuthSuccess(userId));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }
}
