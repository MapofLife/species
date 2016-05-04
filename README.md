# static-modules

These modules are intended to be deployed as static applications via git submodules within the mol.org repository.

They can and should use globablly shared client-side resources (css, html partials, html imports / web components) 
made available via that repo, but otherwise should handle their own state, routing, views, and communication with the MOL api.
