(function(name,data){
 if(typeof onTileMapLoaded === 'undefined') {
  if(typeof TileMaps === 'undefined') TileMaps = {};
  TileMaps[name] = data;
 } else {
  onTileMapLoaded(name,data);
 }})("diskette1",
{ "height":32,
 "layers":[
        {
         "height":32,
         "image":"..\/..\/graphics\/diskette\/sky.png",
         "name":"Background",
         "opacity":1,
         "properties":
            {
             "active":"true",
             "parallax":"0",
             "velocityX":"7",
             "velocityY":"0"
            },
         "type":"imagelayer",
         "visible":true,
         "width":48,
         "x":0,
         "y":0
        }, 
        {
         "color":"#bee0ff",
         "draworder":"topdown",
         "height":32,
         "name":"Sky",
         "objects":[
                {
                 "height":96,
                 "name":"Sun",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"ScenerySun",
                 "visible":true,
                 "width":96,
                 "x":200,
                 "y":184
                }],
         "opacity":1,
         "properties":
            {
             "parallax":"5"
            },
         "type":"objectgroup",
         "visible":true,
         "width":48,
         "x":0,
         "y":0
        }, 
        {
         "color":"#55aaff",
         "draworder":"topdown",
         "height":32,
         "name":"Buildings",
         "objects":[
                {
                 "height":64,
                 "name":"Pyramid",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"SceneryPyramid",
                 "visible":true,
                 "width":64,
                 "x":146.515151515152,
                 "y":353.848484848485
                }, 
                {
                 "height":64,
                 "name":"Pyramid",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"SceneryPyramid",
                 "visible":true,
                 "width":64,
                 "x":538.666666666667,
                 "y":593.787878787879
                }, 
                {
                 "height":64,
                 "name":"Pyramid",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"SceneryPyramid",
                 "visible":true,
                 "width":64,
                 "x":-233.333333333333,
                 "y":459.090909090909
                }],
         "opacity":1,
         "properties":
            {
             "parallax":"10"
            },
         "type":"objectgroup",
         "visible":true,
         "width":48,
         "x":0,
         "y":0
        }, 
        {
         "data":[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
         "height":32,
         "name":"Blocks",
         "opacity":1,
         "properties":
            {
             "baked":"true",
             "collisionResponse":"\"static\"",
             "image":"\"blocks.png\""
            },
         "type":"tilelayer",
         "visible":true,
         "width":48,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":32,
         "name":"Dynamics",
         "opacity":1,
         "properties":
            {
             "baked":"true",
             "collisionResponse":"\"static\"",
             "image":"\"dynamics.png\""
            },
         "type":"tilelayer",
         "visible":true,
         "width":48,
         "x":0,
         "y":0
        }, 
        {
         "draworder":"topdown",
         "height":32,
         "name":"Entities",
         "objects":[
                {
                 "height":68,
                 "name":"Player",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Player",
                 "visible":true,
                 "width":40,
                 "x":640,
                 "y":672
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":1183,
                 "y":733
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":904,
                 "y":472
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":904,
                 "y":384
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":644,
                 "y":509.333333333333
                }, 
                {
                 "height":32,
                 "name":"Foo",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":1408,
                 "y":952
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":644,
                 "y":477.333333333333
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":644,
                 "y":445.333333333333
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":840,
                 "y":808
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":644,
                 "y":381.333333333333
                }, 
                {
                 "height":32,
                 "name":"Bar",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":769.333333333333,
                 "y":468
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":1440,
                 "y":960
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":352,
                 "y":616
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":644,
                 "y":317.333333333333
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":644,
                 "y":349.333333333333
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":705.333333333333,
                 "y":468
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":840,
                 "y":744
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":840,
                 "y":680
                }, 
                {
                 "height":32,
                 "name":"Springer",
                 "properties":
                    {
                     "collisionResponse":"\"static\""
                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":904,
                 "y":424
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":644,
                 "y":285.333333333333
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":644,
                 "y":413.333333333333
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":1368,
                 "y":728
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":456,
                 "y":376
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":1455,
                 "y":721
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":705.333333333333,
                 "y":428
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":737.333333333333,
                 "y":428
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":960,
                 "y":960
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":705.333333333333,
                 "y":508
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":515,
                 "y":680
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":1264,
                 "y":944
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":336,
                 "y":376
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":520,
                 "y":728
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":737.333333333333,
                 "y":468
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":705.333333333333,
                 "y":388
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":1232,
                 "y":736
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":1136,
                 "y":728
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":737.333333333333,
                 "y":508
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":848,
                 "y":504
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":769.333333333333,
                 "y":508
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":1423,
                 "y":721
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":904,
                 "y":506.666666666667
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":248,
                 "y":728
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":176,
                 "y":592
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":312,
                 "y":728
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":208,
                 "y":592
                }, 
                {
                 "height":32,
                 "name":"Diskette",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":280,
                 "y":728
                }, 
                {
                 "height":86,
                 "name":"Hal",
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"Computer",
                 "visible":true,
                 "width":76,
                 "x":407.333333333333,
                 "y":681.333333333333
                }, 
                {
                 "height":0,
                 "name":"",
                 "polygon":[
                        {
                         "x":0,
                         "y":0
                        }, 
                        {
                         "x":-160,
                         "y":-128
                        }, 
                        {
                         "x":0,
                         "y":-128
                        }],
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"",
                 "visible":true,
                 "width":0,
                 "x":1504,
                 "y":424
                }, 
                {
                 "height":0,
                 "name":"PolyG",
                 "polygon":[
                        {
                         "x":0,
                         "y":0
                        }, 
                        {
                         "x":-224,
                         "y":96
                        }, 
                        {
                         "x":0,
                         "y":96
                        }],
                 "properties":
                    {

                    },
                 "rotation":0,
                 "type":"",
                 "visible":true,
                 "width":0,
                 "x":1504,
                 "y":448
                }, 
                {
                 "height":32,
                 "name":"Springer",
                 "properties":
                    {
                     "collisionResponse":"\"static\""
                    },
                 "rotation":0,
                 "type":"Diskette",
                 "visible":true,
                 "width":32,
                 "x":960,
                 "y":504
                }, 
                {
                 "height":0,
                 "name":"Graphics",
                 "polygon":[
                        {
                         "x":0,
                         "y":0
                        }, 
                        {
                         "x":32,
                         "y":-32
                        }, 
                        {
                         "x":96,
                         "y":-32
                        }, 
                        {
                         "x":128,
                         "y":32
                        }, 
                        {
                         "x":0,
                         "y":64
                        }],
                 "properties":
                    {
                     "fillColor":"0xFF0000"
                    },
                 "rotation":0,
                 "type":"A_.SPRITES.Graphics",
                 "visible":true,
                 "width":0,
                 "x":1216,
                 "y":352
                }],
         "opacity":1,
         "type":"objectgroup",
         "visible":true,
         "width":48,
         "x":0,
         "y":0
        }, 
        {
         "color":"#ffff7f",
         "draworder":"topdown",
         "height":32,
         "name":"HUD",
         "objects":[
                {
                 "height":32,
                 "name":"Text",
                 "properties":
                    {
                     "fill":"\"Green\"",
                     "text":"\"Hello World!\""
                    },
                 "rotation":0,
                 "type":"A_.SPRITES.Text",
                 "visible":true,
                 "width":32,
                 "x":32,
                 "y":32
                }],
         "opacity":1,
         "properties":
            {
             "parallax":"0"
            },
         "type":"objectgroup",
         "visible":true,
         "width":48,
         "x":0,
         "y":0
        }],
 "orientation":"orthogonal",
 "properties":
    {

    },
 "renderorder":"right-down",
 "tileheight":32,
 "tilesets":[
        {
         "firstgid":1,
         "image":"..\/..\/graphics\/diskette\/blocks.png",
         "imageheight":32,
         "imagewidth":64,
         "margin":0,
         "name":"blocks",
         "properties":
            {

            },
         "spacing":0,
         "tileheight":32,
         "tilewidth":32
        }, 
        {
         "firstgid":3,
         "image":"..\/..\/graphics\/diskette\/dynamics.png",
         "imageheight":32,
         "imagewidth":160,
         "margin":0,
         "name":"dynamics",
         "properties":
            {

            },
         "spacing":0,
         "tileheight":32,
         "tilewidth":32
        }],
 "tilewidth":32,
 "version":1,
 "width":48
});