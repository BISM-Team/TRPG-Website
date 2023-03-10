# TRPG-Website

A complete Website for playing Tabletop Role Playing Games with friends, with features ranging from running Campaigns with music and interactive 3D/2D battle maps, to sharing lore and information with players with a GM-created World Wiki for the players to consult and enrichen with new information, and of course Character creation and tools for adding any Homebrew content needed very easily. 

The Homebrew system is designed to make adding new classes, races, spells, ecc.. very simple; but also adding a entirely new game system of your choice is as easy as defining a new character model and adding classes and races.

Team's Drive: https://drive.google.com/drive/folders/16ZKj4r6NB8rz4NL2uv2Qp9gLF_x1gesp?usp=sharing


## Git Repo basics

Branch 'master' contains the stable version of this app, the branch is protected and can't be modified without approval.

Branch 'dev' is the developement branch, all branches that make changes should start from this branch and merge back to it when changes are ready to be integrated in the developement version.

There could be Submodules: Repositories that are kept separate from the root Repository but are included in it, dnd-battlemap is the first example.

### How to use this repo

#### Getting the repo:

```
git clone https://github.com/BISM-Team/TRPG-Website
cd TRPG-Website
git submodule init
git submodule update
git checkout dev
```

#### Before doing anything: create and publish a branch for your changes:

```
git branch my_changes
git checkout my_changes
git push --set-upstream my_changes
--- work, commit and push to 'my_changes' regularly ---
```

#### When you are finished with your changes open a pull request from 'my_changes' to 'dev'

```
Go to https://github.com/BISM-Team/TRPG-Website/pulls
New Pull Request
base 'dev', compare 'my_changes'
```

If there are merge conflicts: resolve them.

Then ask for approval of the Pull Request to another member.   
When approval is granted, from the Pull Request page you can merge the Pull Request and delete the branch 'my_changes'.
