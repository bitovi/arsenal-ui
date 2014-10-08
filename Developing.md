# Setting up Arsenal

## Configuring git

Some configuration is desirable when working on this project with git. These are optional, however.

```sh
$ git config --global push.default simple
$ git config --global color.ui true
$ git config --global alias.lol "log --graph --decorate --abbrev-commit --date=relative --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(cyan)<%an>%Creset'"
```

## Installing Node
If you have Homebrew, this is easy:

```sh
$ brew install node
```

Otherwise, you'll have to do it the long way around:

1. Go to http://nodejs.org/download/
2. Download and run the installer
3. Open a terminal window and run the command `node -v`. you should see:

```sh
$ node -v
v0.10.24 // version number may be different
```

## Installing Arsenal

1. Request GitLab permission from someone on the team with access (Eli or Sudesna).
1. Create and navigate to the folder where you want the project to live, on
the command line.
1. Run these commands:

```sh
$ git clone git@gitlab.sd.apple.com:ist-finance/arsenal.git && cd arsenal
$ sudo npm install -g grunt-cli bower http-server
$ npm install && bower install
```

## Running Arsenal

1. Make sure you are in the `arsenal` directory (the one you created when you cloned the project).
1. Run `http-server` on the command line.
1. Visit http://localhost:8080/ in your browser.

# Developing for Arsenal

On this project, we use a specific workflow for writing new features and fixing bugs. This workflow helps to make sure that all changes go through a code review process, and that the radar workflow and the development workflow are synchronized.

The workflow involves three kinds of branches:

* The **master** branch, which should always be stable and is the branch that gets pushed to other environments.
* The **develop** branch, which has all the reviewed code changes in it.
* Development (or **dev/**) branches, where developers make their changes.

No one except the designated project integrator should push to `develop` or `master`.

Here is the entire workflow, from being assigned a radar to releasing the app:

1. Set the radar you're working on to **Analyze/Fix** status.
1. Start a development branch. You should only work on one feature or bug in each development branch.
1. Work on the development branch, committing and pushing to origin when sensible.
1. When you're done with your work, go to [Gitlab's merge requests page](https://gitlab.sd.apple.com/ist-finance/arsenal/merge_requests) and create a new merge request from your development branch to the `develop` branch.
 * Put the associated radar URL in the title of the merge request, along with a short description of what you changed.
 * If you need more detail, use the *Description* field.
 * Assign the merge request to someone else on the team for review. (To start, this will be Eli or Sudesna).
 * Remember to submit your merge request.
1. Update the associated radar:
 * Set the status to **Analyze/Review**.
 * Set the resolution to **Software Changed**.
 * Put a link to the merge request you just submitted in the *Diagnotics* section.
 * Assign the radar to the person you assigned the merge request above to.
1. The reviewer will review your change by reading the code diff, running the code, verifying that tests pass, and making sure that the change actually achieves what it is meant to achieve. (Other people can review your code at this stage too!)
1. If there are issues with the changes:
 * The reviewer will leave appropriate comments to tell you where the issues are.
 * The reviewer will put a *-1* in the comments for the merge request.
 * The associated radar should have its status set back to **Analyze/Fix** and be reassigned to you.
 * The merge request will stay open.
1. If there are no issues with the changes:
 * The reviewer will leave a *+1* in the comments for the merge request.
 * The associated radar will have its status set to **Integrate**.
 * The merge request will stay open.
 * **At this point, you are done with this branch and can move on to another radar.** No more work should be done on this development branch at this stage. Further items need to be done in a new development branch with a separate merge request, even if it is for the same radar.
1. The project integrator will, at regular intervals, take all merge requests with *+1* on them and merge them into the `develop` branch and move the associated radars to **Build** status.
1. Then, if the application seems stable on the `develop` branch, the project integrator will [increment the version number appropriately](http://semver.org/) and push the changes to the `master` branch. This will probably trigger a build and push to the dev environment.

Let's break this down into smaller, more detailed pieces.

## Working on a development branch

When you first get started on a radar, you'll need to **create the branch** and push it to the origin. (The "origin" here is the GitLab repository.) I'll use the radar *&lt;rdar://problem/123456789&gt; Yak needs shaving.* as an example.

```sh
$ cd /path/to/arsenal
$ git checkout develop # start from the develop branch
$ git pull # make sure your repo is up to date
$ git checkout -b dev/123456789/shaving-the-yak # make the new branch and switch to it
$ git push -u origin HEAD # push your new branch to the origin
```

Now that you have the development branch, do the work you need to. Create new files, change existing ones, add tests &mdash; whatever you need to satisfy the radar. Once you're done (or when you're at a good stopping point), you'll want to commit your work.

```sh
$ git status # shows you what files have been added, modified, moved, or deleted
$ git add <files you want to commit> # stage files to be committed
$ git commit -m "<rdar://problem/123456789> Sharpened the razor and shaved the yak." # commit your changes with a descriptive commit message
$ git push origin HEAD # push your commit to the copy of your branch at the origin
```

### Working on someone else's development branch

Occasionally, you may have to take over someone else's branch or work together with someone else. If this is the case, there are a few differences in how you create and commit to the branch.

If another person has already created the shared branch and pushed it to origin:

```sh
# instead of git checkout -b dev/1234567789/shaving-the-yak
$ git checkout -t origin/dev/12456789/shaving-the-yak # check out the existing branch from the origin
```

After committing to the shared branch (and before pushing to origin):
```sh
$ git pull --rebase # pull changes your collaborator has made and play your changes on top of them
```

`git pull --rebase` is also a good idea to do when you come back to a shared branch after a while so you know your branch is current.

# Doing DevOps with Arsenal

## Merging changes into `develop`

Only the project integrator should merge changes into the `develop` branch, and only after they have been reviewed and given a *+1* from the reviewer. **Do not merge unreviewed code into `develop`.**

For this example, I'll assume that the `dev/123456789/shaving-the-yak` branch has been reviewed and has at least one *+1* on its merge request in GitLab, and so is ready to be merged.

```sh
# get set up:
$ cd /path/to/arsenal
$ git checkout develop # start from the develop branch
$ git pull # make sure the repo is up to date
$ git reset origin/develop #make sure your repo knows where origin's develop branch is

# check out and examine the branch:
$ git checkout -t origin/dev/123456789/shaving-the-yak # check out and switch to the branch to be merged
$ git rebase develop # make sure it is sitting on top of the latest develop
$ grunt build # make sure the branch builds! if it doesn't build, DO NOT CONTINUE!
$ git push -f origin HEAD # overwrite the copy of this branch on origin with this (possibly-rebased) branch

# merge the branch into develop:
$ git checkout develop # switch back to develop
# if there is only one commit in dev/123456789/shaving-the-yak, you can omit --no-ff here
$ git merge --no-ff dev/123456789/shaving-the-yak # merge the development branch into develop
$ git push origin HEAD # push develop to the origin

# clean up:
$ git branch -d dev/123456789/shaving-the-yak # delete your local copy of the branch
# this command should close the merge request, but sometimes merge requests need to be closed by hand
$ git push origin :dev/123456789/shaving-the-yak # delete the copy of the branch on the origin

# after merging all the branches, make sure develop still builds:
$ git checkout develop # switch to develop
$ git pull # make sure you're on the latest develop (this should do nothing in most cases)
$ grunt build # make sure this succeeds and looks sane
```

After you are done with this, you can take all the radars associated with the branches you just merged and set them to **Build** status. If some of the merge requests associated with those branches aren't closed, close them.

## Making a release

This should only be done by the project integrator. While there are grunt tasks associated with making a release, those grunt tasks are just collections of `git` and `npm` commands. It's recommended you look at them and understand what each command does.

Before making a release, make sure that the `develop` branch is stable and sane. Decide whether this release is a patch release, a minor release, or a major release according to [semantic versioning](http://semver.org/). We do not use pre-release or build metadata in this versioning scheme.

```sh
# build the application and increment the version number appropriately
$ grunt release:patch
# OR
$ grunt release:minor
# OR
$ grunt release:major
```

At this point, you should fire up the application and make sure it looks stable and sane and that nothing is broken.

```sh
# push develop to master and master back to develop, and both to their origins
$ grunt publish
```

This command will trigger a Jenkins job that pushes the master branch of the application to the dev server and builds it.

Now, take all the radars that are in **Build** status and put the new version number (`v0.0.1`, for example) in the *Diagnostics* box to note what version they were pushed with, then move them to the **Verify** status. Send out an email with all the radars that were pushed in this version to the team with the new version number as the subject line.

Congratulations! You just published a version of Arsenal!
