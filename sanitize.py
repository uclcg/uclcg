import os

lines = []

with open(os.path.join(os.getcwd(), 'public/html/index.html'), 'r') as idxFile:
  for line in idxFile.readlines():
    if 'public' in line:
      line = line.replace('public', 'uclcg/public')
    lines.append(line)

with open(os.path.join(os.getcwd(), 'public/html/tmp.html'), 'w') as newFile:
  for line in lines:
    newFile.write(line)

os.remove(os.path.join(os.getcwd(), 'public/html/index.html'))
os.rename(os.path.join(os.getcwd(), 'public/html/tmp.html'), os.path.join(os.getcwd(), 'public/html/index.html'))

