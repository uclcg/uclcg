import os
import json
import urllib.request

basepath = os.path.join(os.getcwd(), 'demos')

uclcg_files = [x for x in os.listdir(basepath) if '.uclcg' in x]
thumb_files = [x for x in os.listdir(basepath) if ('.png' in x or '.jpg' in x)]

assert len(uclcg_files) == len(thumb_files), \
    "No. of src files and thumbs doesnt match - {} vs. {}".format(len(uclcg_files), len(thumb_files))

num_files = len(uclcg_files)

jsFiles = [] * num_files
categories = [] * num_files
thumb_urls = [] * num_files
niceNames = [] * num_files
shortDescriptions = [] * num_files
authors = [] * num_files
hidden = [] * num_files

with open(os.path.join(os.getcwd(), 'pathFile.txt'), 'r') as pathFile:
    for line in pathFile.readlines():
        if not line.startswith('http'): continue

        segs = line.split(',')

        jsFiles.append(segs[0].replace(' ', ''))            # jsFile URL
        categories.append(segs[1].replace(' ', ''))         # tabGroup
        thumb_urls.append(segs[2].replace(' ', ''))         # thumb url
        niceNames.append(segs[3])                           # Displayed name
        shortDescriptions.append(segs[4])                   # caption
        authors.append(segs[5].replace(' ', ''))            # author - not used
        hidden.append(segs[6].strip().replace(' ', ''))     # isHidden bool

db = {'jsFiles': jsFiles,
      'categories': categories,
      'pictures': thumb_urls,
      'niceNames': niceNames,
      'shortDescriptions': shortDescriptions,
      'authors': authors,
      'hidden': hidden}

with open(os.path.join(basepath, 'db.json'), 'w') as file:
    json.dump(db, file)
