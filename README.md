# TRPG-Website

A complete Website for playing Tabletop Role Playing Games with friends, with features ranging from running Campaigns with music and interactive 3D/2D battle maps, to sharing lore and information with players with a GM-created World Wiki for the players to consult and enrichen with new information, and of course Character creation and tools for adding any Homebrew content needed very easily.

The Homebrew system is designed to make adding new classes, races, spells, ecc.. very simple; but also adding a entirely new game system of your choice is as easy as defining a new character model and adding classes and races.

Team's Drive: https://drive.google.com/drive/folders/16ZKj4r6NB8rz4NL2uv2Qp9gLF_x1gesp?usp=sharing

## Git Repo basics

Branch 'master' contains the stable version of this app, the branch is protected and can't be modified without approval.

Branch 'dev' is the developement branch, all branches that make changes should start from this branch and merge back to it when changes are ready to be integrated in the developement version.

### How to use this repo

#### Getting the repo:

```
git clone https://github.com/BISM-Team/TRPG-Website
cd TRPG-Website
git checkout dev
npm install
npx prisma generate
```

Check that `npm run check` does not return more than 5 errors.

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

## Specific contributions

Some common contributions are adding new Game Systems or public Characters and Wiki Pages, and adding new Dashboard Card types to expand Dashboard behaviour.

### Cards

You can add a Svelte component into `src/lib/components/Dashboard/Cards` which implements your desired behaviour and exports certain props.

To "register" the component and make it creatable from the Frontend you have to add a field with the name of your Card to `prisma/schema.prisma/CardTypes` and an entry into `src/lib/components/Dashboard/Cards/cards_map.ts` which defines how to create that Card from the UI.
The form for the latter entry, for a component named "text" with only one string prop is:

```
text: {
  component: Text,
  props: {
    source: "default source",
    array: [""],
    array_number: [1],
    object: {
      characterName: "defaultName",
      initiative: 10
    }
  } satisfies ComponentProps<Text>,
},
```

Props defines which props are exported by the components its default values (`satisfies ComponentProps<...>` is a Type Safety measure that enforces you to write the correct props).

The types of the props are inferred on the default value, there is experimental support for arrays and nested objects, so any props object should work and receive proper UI.
