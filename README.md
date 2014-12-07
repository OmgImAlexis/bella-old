bella
==================

To run use ``sudo node ducking-octo-spice.js``

A **LOT** of the code needs to be fixed and/or rewitten this is just me trying to port sickrage/sickbeard to node.js
If you find any actual bugs let me know using the issues tab on the right, if it's something that is more of a hardcoded issue or something to do with an feature that's being worked on then don't worry about it as it'll be looked into as I'm working on it.



##### Please and thank you
Most pull requests will be accepted but please comment about what the code is for so it's easier to scan through especailly if you've changed a lot of the code.



##### Errors / Hardcoded items
At the moment you'll need sickrage running on port 8081 with the IP of 192.168.1.180 for the styles to work, the reason it's like that is I'm currently using it as a base for the whole program but I plan on writing my own styles for this or getting someone else todo it and submit a pull request, if you'd like to help with that I'd really appreciate it.

##### Current "issues" that aren't bugs as such
- IP of css file is hardcoded
- Walker only works on files with ``/Show Folder/Show Name/S00E00 - EpisodeName.ext`` format
- Movies don't work at all
- Whole interface only works in English








### How to get stated with this
[Install MongoDB](http://docs.mongodb.org/manual/installation/)
```
git clone https://github.com/OmgImAlexis/ducking-octo-spice
cd ducking-octo-spice
npm install
node ducking-octo-spice.js
```

I'd also suggest you install forever so you can run it without keeping a terminal open.

Todo so just run ``npm install forever -g`` and then ``forever start ducking-octo-spice.js``
