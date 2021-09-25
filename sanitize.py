import os

# rewrite index.html, such that repo name is prepended to path info.
# necessary to have working local grunt builds and easy commit-push functionality on github pages.

repo_name = 'uclcg'
lines = []

with open(os.path.join(os.getcwd(), 'public/html/index.html'), 'r') as idxFile:
  for line in idxFile.readlines():
    if 'public' in line:
      line = line.replace('public', '{}/public'.format(repo_name))
    lines.append(line)

with open(os.path.join(os.getcwd(), 'public/html/tmp.html'), 'w') as newFile:
  for line in lines:
    newFile.write(line)

os.remove(os.path.join(os.getcwd(), 'public/html/index.html'))
os.rename(os.path.join(os.getcwd(), 'public/html/tmp.html'), os.path.join(os.getcwd(), 'public/html/index.html'))

