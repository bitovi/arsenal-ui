# clean up any previous clones
rm -rf ./arsenal-ui ./arsenal-ui.tgz
# clone the repo
git clone git@gitlab.corp.apple.com:ist-finance/arsenal-ui.git arsenal-ui
# go into the repo
cd ./arsenal-ui
# grab dependencies
npm install
npm update
./node_modules/bower/bin/bower install
./node_modules/bower/bin/bower update
# make a build
grunt
# tar up the files
cd ./dist/bundles
tar -czf arsenal-ui.tgz ./*
# move the tar into where it's supposed to be
cd ../../../
cp ./arsenal-ui/dist/bundles/arsenal-ui.tgz .
