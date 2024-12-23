{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    (pkgs.nodejs.override { version = "20.18.0"; })
  ];
}
