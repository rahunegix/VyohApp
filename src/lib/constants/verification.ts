export const ID_DOCUMENT_OPTIONS = [
  { value: "aadhaar", key: "id_doc_aadhaar" },
  { value: "pan", key: "id_doc_pan" },
  { value: "driving_license", key: "id_doc_dl" },
  { value: "voter_id", key: "id_doc_voter" },
  { value: "passport", key: "id_doc_passport" },
] as const;

export const REFERENCE_TYPES = [
  { value: "friend", key: "ref_type_friend", descKey: "ref_type_friend_desc" },
  { value: "family", key: "ref_type_family", descKey: "ref_type_family_desc" },
] as const;

export const FRIEND_RELATION_OPTIONS = [
  { value: "close_friend", key: "rel_close_friend" },
  { value: "colleague", key: "rel_colleague" },
  { value: "childhood_friend", key: "rel_childhood_friend" },
  { value: "neighbor", key: "rel_neighbor" },
  { value: "other", key: "rel_other" },
] as const;

export const FAMILY_RELATION_OPTIONS = [
  { value: "father", key: "rel_father" },
  { value: "mother", key: "rel_mother" },
  { value: "brother", key: "rel_brother" },
  { value: "sister", key: "rel_sister" },
  { value: "uncle", key: "rel_uncle" },
  { value: "aunt", key: "rel_aunt" },
  { value: "cousin", key: "rel_cousin" },
  { value: "other", key: "rel_other" },
] as const;
