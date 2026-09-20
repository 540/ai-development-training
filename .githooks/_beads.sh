hook=$(basename "$0")

if [ -x ".beads/hooks/$hook" ]; then
  ".beads/hooks/$hook" "$@" || exit $?
fi
