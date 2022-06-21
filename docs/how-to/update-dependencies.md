---
layout: page
title: How to update dependencies
permalink: /how-to/update-dependencies
---

## _Before_ you update anything

Run `npm check-all` from the project root directory to verify that everything is currently working on your device.

## Update minor versions

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
- If migrating is very hard and would be better handled as a dedicated task, you could just downgrade the package that broke and see if the `check-all` script passes.
  - If you do this, [create a new task](https://github.com/skill-collectors/agile-poker/issues/new?assignees=&labels=&template=new-task.md&title=) immediately.
  - Include as much detail as possible, including what error message you are seeing, research you've done, and debugging steps you've tried.
  - If the dependency needs to be updated for a security fix, mark the task _Priority_ as **Urgent**.
- If it's not clear what dependency caused the break, you could `git checkout . && npm install` to undo the update and then try updating one item at a time.
- Don't be afraid to ask for help in the [Gitter chat](https://gitter.im/skill-collectors/agile-poker)!

## Conclusion

When you are finished and the `check-all` task succeeds, push your branch and open a PR for review. If any of the GitHub actions checks fail, please investigate and resolve the issue.
