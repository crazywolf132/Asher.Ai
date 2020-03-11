{
  "targets": [
    {
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "target_name": "brain",
      "sources": [ "core/functions/brain.cpp" ],
      "cflags_cc": [
        "-std=c++17"
      ]
    }
  ]
}