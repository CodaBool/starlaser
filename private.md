# links
- https://www.naturalearthdata.com/downloads/50m-cultural-vectors
- https://geojson.io (saves topojson at 3x the size as mapshaper!)
- https://mapshaper.org
- https://jsonformatter.org/json-pretty-print
- https://nerdcave.com/tailwind-cheat-sheet
- icon https://lucide.dev/icons
- merge 2 geojson when data rows are different https://findthatpostcode.uk/tools/merge-geojson
- svg to code https://nikitahl.github.io/svg-2-code
- svg minimize https://svgomg.net
- mapbox pricing https://console.mapbox.com
- turf https://turfjs.org/docs/api/centroid
- maplibre gl https://maplibre.org/maplibre-gl-js/docs/API
- react map gl https://visgl.github.io/react-map-gl/docs/api-reference/maplibre/map
- maplibre style editor https://maplibre.org/maputnik

# icons
- https://game-icons.net

# inspo
- https://www.google.com/maps/d/u/0/viewer?hl=en_US&mid=1puuQVpbfh4ofYflJxJPB6iul6JQ&ll=40.00675267193506%2C-74.04422471111134&z=7
- https://github.com/MeepChangeling/FalloutTTRPGWorldMap
- vaults = https://fallout.fandom.com/wiki/Map:FO_Vault_Map_(base_1959_map)
- extra = https://fallout.fandom.com/wiki/Map:FO_United_States_Map_(base_1959_map)

# commands
- npx mapshaper -i topo1.json topo2.json combine-files -merge-layers -o merge.json

# rules
- all styling depends on map/{type & faction}

# Fallout location types
- base
- settlement
- town
- city
- vault
- building
- cave
- region
- compound

# Region change
- all factions, regions, clusters will now be type "region". Neutral states, countries, and Lancer guide. Will now be "null" type. Regions will now use a faction prop which will determine further detail

# todo:
- solve text issue for Lancer
- solve icons are too close
- style fixes, too dark
- peak at tooltip code = https://visgl.github.io/react-map-gl/examples/maplibre/geojson
- 3d terrain = https://visgl.github.io/react-map-gl/examples/maplibre/terrain

# menu items needed
- measure btn
- coordinate
- layer toggle

# Events
## moving mouse on mobile
touchMove
pointerMove (both platforms)

## click start on mobile
touchStart
pointerEnter
pointerDown (both platforms)

## click end on mobile
touchEnd
pointerOut
pointerUp (both platforms)

--------------------------------

## click start on desktop
mouseDown

## click end on desktop
click

## moving mouse on desktop
mouseMove
