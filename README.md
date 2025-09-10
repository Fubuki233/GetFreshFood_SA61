# How to use git for synchronizing
## Environment setup
Setup git first(Github may will help u while registering) 
## Init loacl repo:
#### type in command console:
```bash
cd "Your/Folder/Path"                       # Go to your project folder
git clone https://github.com/Fubuki233/GetFreshFood_SA61.git #Clone the repo

```

Then, a new folder names GetFreshFood_SA61 will be created,type:  
```bash
cd "Your/Folder/Path/GetFreshFood_SA61"  
```
Now, all the files should be downloaded.

## Push/Pull
## Push / Pull Workflow
Before you start programming, always pull the latest code:

```bash
git pull
```
After making changes, push your code to the remote repository:

```bash
git add . #add all files that u changed
git commit -m "your commit message" #The commit message will be seen in github, it better to clearfiy what you have done.
git push #push to github
```
## Handling Conflicts
If your local code conflicts with the remote main branch, Git will prompt you to resolve conflicts.  
You can choose to merge, drop your changes, or force your local code to overwrite the remote:

### Merge
When you pull and see a conflict, Git will mark the conflicting files.  
Do the following:

```bash
# Open the conflicted files and manually resolve the conflicts.
# After resolving, add the files:
git add <conflicted-file>
# Then commit the merge:
git commit -m "commit message"
# Finally, push your changes:
git push
```

### Drop:
If you want to discard your local changes and use the remote version:

```bash
#This will delete your local changes!
git reset --hard origin/main
git pull
```

### Force overwrite:
```bash
git push -u origin main --force 
#dont do this unless u know what you are doing
```

