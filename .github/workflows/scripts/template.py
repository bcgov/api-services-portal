
import sys
import os

t = open(sys.argv[1]).read().format(**os.environ)

with open(sys.argv[2], 'w') as outfile:
  outfile.write(t)
