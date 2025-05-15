part of 'auth_bloc.dart';

abstract class AuthEvent {}

class LoginEvent extends AuthEvent {
  final String email;
  final String password;
  LoginEvent(this.email, this.password);
}

class RegisterEvent extends AuthEvent {
  final String name;
  final String email;
  final String password;
  final String number;
  final String userName;
  RegisterEvent(
    this.name,
    this.email,
    this.password,
    this.number,
    this.userName,
  );
}
