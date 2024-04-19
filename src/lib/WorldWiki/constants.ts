export const allowed_page_names_with_anchor_regex = new RegExp(
  '[A-Za-z0-9_-]+ *[A-Za-z0-9_-]+#?[A-Za-z0-9_-]+ *[A-Za-z0-9_-]+',
  'g'
);
export const allowed_page_names_regex_whole_word = new RegExp('^[A-Za-z0-9_-]+ *[A-Za-z0-9_-]+$');

