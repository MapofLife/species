# The species module

A species information and mapping application, written for Angular 1.5.x.

After cloning, install client dependencies...

```
bower update
```

Clone the MOL UI components into a seperate directory and link them in with bower

```
git clone git@github.com:MapofLife/ui-components /path/to/my/workspace/
cd /path/to/my/workspace/ui-components
bower link
cd /path/to/my/workspace/species
bower link mol-ui-components
```

Then build with...

```
npm install
grunt
```

That should leave you with a working development client at /src/index.html and a compiled production client at /dist/index.html

Both of these rely on css hosted at //mol.org/ for the MOL theme.

All routes in the app are relative to /{module_name}/ and handled by ui-router client side configurations. 

