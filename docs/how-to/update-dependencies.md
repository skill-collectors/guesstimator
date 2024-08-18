---
title: How to update dependencies
permalink: /how-to/update-dependencies
---

## _Before_ you update anything

Fetch the `main` branch and create a new branch from the latest commit on `main`. A good name for the branch would be `[yyyy-mm-dd]-dependency-updates` (as in, `2022-11-01-dependency-updates`).

Run `npm check-all` from the project root directory to verify that everything is currently working on your device.

## Merging dependabot PRs

If there are open dependabot PRs and you wan to include them in your branch, you can `cherry-pick` each commit, but you will need to deal with merge conflicts. This bash snippet provides a basic workflow for doing that:

```bash
for b in $(git branch -r | grep dependabot | awk '{print $1}'); do
  git cherry-pick $b || bash
done
```

This will cherry-pick each dependabot update, and if the cherry-pick fails (likely due to a merge conflict) it will drop you into a new bash shell to resolve. Each time this happens, you'll want to follow these basic steps:

```bash
rm package-lock.json # don't bother resolving conflicts in the lock file
git mergetool # fix merge conflicts in package.json files
npm install # regenerate the lock file
git cherry-pick --continue # finish the cherry-pick operation for the current dependabot branch
exit # drop out of the subshell and back into the for loop above
```

Eventually the `for` loop will complete and you should have a branch that includes all the dependabot updates together.

## Update minor versions

Even if you include dependabot updates (see above) there are likely a few minor/patch versions you can apply and it's a good idea to do so.

```sh
npm update
```

This will update packages according to how they are declared in `package.json`. Most use a caret (e.g. `^1.0.0`) which allows automatic upgrades to any new patch or minor version, but not major version. The syntax is [documented further in the NPM docs](https://docs.npmjs.com/about-semantic-versioning#using-semantic-versioning-to-specify-update-types-your-package-can-accept).

Rerun the checks:

```sh
npm check-all
```

Debug any failures. Some google-fu may be required.

Once the `check-all` task succeeds, it would be a good time to make a Git commit:

```sh
git commit -A -m "Update non-major version dependencies"
```

## Update major versions

See what is still outdated:

```sh
npm outdated
```

Update everything listed to the latest version in each project's `package.json` and then:

```sh
npm install
npm run check-all
```

At this point it's s little more likely that something will break. You will have to do some research and make a judgement call about how to proceed. Some different options would be:

- If you can determine what dependency caused the break, you could research what changed and do the necessary work to migrate our app to the new version. This is the most ideal solution.
  - You can use `git bisect` to do this. See below.
- If migrating is very hard and would be better handled as a dedicated task, you could just downgrade the package that broke and see if the `check-all` script passes.
  - If you do this, [create a new task](https://github.com/skill-collectors/guesstimator/issues/new?assignees=&labels=&template=new-task.md&title=) immediately.
  - Include as much detail as possible, including what error message you are seeing, research you've done, and debugging steps you've tried.
  - If the dependency needs to be updated for a security fix, mark the task _Priority_ as **Urgent**.
- If it's not clear what dependency caused the break, you could `git checkout . && npm install` to undo the update and then try updating one item at a time.
- Don't be afraid to ask for help in the [Gitter chat](https://gitter.im/skill-collectors/guesstimator)!

### Using Git Bisect

Git bisect is a tool for finding which commit in a series introduced a bug. This makes it perfect for analyzing breakage after applying a series of dependabot commits.

Assuming you have cherry-picked all the dependabot commits on one branch (as described [above](#merging-dependabot-prs)), you can begin by running:

```sh
# git bisect start [bad commit] [good commit]
git bisect start HEAD main
```

Your workspace will be moved to a commit in the series. Run whatever test you need to in order to determine whether that commit builds (either `npm run check-all` or just `npm run -w frontend test:unit` if e.g. only frontend unit tests are failing).

If your tests pass, run `git bisect good`, otherwise run `git bisect bad`.

Git will do a [binary search](https://en.wikipedia.org/w/index.php?title=Binary_search_algorithm&oldid=1170087932) to efficiently identify the bad commit. Once it's been found, Git will print the commit message for the commit that broke the build. If it's a dependabot commit, then the message should include release notes and changelog links. Click those to start figuring out the problem.

See also: [git-bisect documentation](https://git-scm.com/docs/git-bisect)

## Conclusion

When you are finished and the `check-all` task succeeds, push your branch and open a PR for review. If any of the GitHub actions checks fail, please investigate and resolve the issue.
