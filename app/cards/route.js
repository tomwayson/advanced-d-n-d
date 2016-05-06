import Ember from 'ember';

export default Ember.Route.extend({
  model(){
    //return a stack of cards
    return {
      "rows": [
        {
          "cards":[]
        },
        {
          "cards":[
            {
              "x": 0,
              "y": 0,
              "width": 4,
              "height": 4,
              "minWidth": 2,
              "component": {
                "name": "placeholder-card"
              }
            },
            {
              "x": 4,
              "y": 0,
              "width": 4,
              "height": 4,
              "minWidth": 2,
              "component": {
                "name": "placeholder-card"
              }
            },
            {
              "x": 0,
              "y": 4,
              "width": 6,
              "height": 4,
              "minWidth": 2,
              "component": {
                "name": "placeholder-card"
              }
            },
            {
              "x": 8,
              "y": 0,
              "width": 4,
              "height": 4,
              "minWidth": 2,
              "component": {
                "name": "placeholder-card"
              }
            },

          ]
        },
        {
          "cards":[{
            "x": 0,
            "y": 0,
            "width": 12,
            "height": 3,
            "minWidth": 2,
            "component": {
              "name": "placeholder-card"
            }
          },
          {
            "x": 2,
            "y": 3,
            "width": 6,
            "height": 4,
            "minWidth": 2,
            "component": {
              "name": "placeholder-card"
            }
          }]
        }
      ]
    };
  }
});
