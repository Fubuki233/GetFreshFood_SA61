# How to use git for synchronizing
## Environment setup
## Git Configuration

### 1. Generate SSH Key
Download Git:
https://git-scm.com/downloads
First, create an SSH key on your local machine:
![ad](https://www.runoob.com/wp-content/uploads/2014/05/github-account.jpg "abs")

```bash
ssh-keygen -t rsa -C "your_email@youremail.com"
```
> Replace `your_email@youremail.com` with the email you used to register on GitHub.  
> When prompted for a path and password, just press Enter to use the default settings.

This will generate a `.ssh` folder in your home directory.  
Open the `id_rsa.pub` file inside `.ssh`, and copy its contents.

### 2. Add SSH Key to GitHub

- Go to GitHub, open **Account Settings**.
- On the left, select **SSH and GPG keys**.
- Click **New SSH key**, fill in any title, and paste the key you just copied.

### 3. Verify SSH Connection

In Git Bash, run:

```bash
ssh -T git@github.com
```

If prompted with "Are you sure you want to continue connecting", type `yes`.  
If you see:

```
You've successfully authenticated, but GitHub does not provide shell access.
```
It means your SSH connection is successful.

### 4. Set Username and Email

GitHub records your username and email for every commit. Set them with:

```bash
git config --global user.name "your name"
git config --global user.email "your_email@youremail.com"
```

### 5. Add Remote Repository

Go to your local repository folder, open Git Bash, and add the remote address:

```bash
git remote add origin git@github.com:yourName/yourRepo.git
```
> Replace `yourName` with your GitHub username and `yourRepo` with your repository name.

You can also check or edit the remote address in the `.git/config` file.

### 6. Initialize a New Repository

Create a new folder, open it, and run:

```bash
git init
```
This will create a new Git repository in 
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

