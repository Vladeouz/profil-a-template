// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:json_annotation/json_annotation.dart';

part 'create_note_body.g.dart';

@JsonSerializable()
class CreateNoteBody {
  const CreateNoteBody({
    required this.title,
    this.body,
  });
  
  factory CreateNoteBody.fromJson(Map<String, Object?> json) => _$CreateNoteBodyFromJson(json);
  
  final String title;
  final String? body;

  Map<String, Object?> toJson() => _$CreateNoteBodyToJson(this);
}
