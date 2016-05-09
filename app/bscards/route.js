import Ember from 'ember';

export default Ember.Route.extend({
  model(){
    //return a stack of cards
    return {
      "sections": [
        {
          "containment":"fixed",
          "style":"background-color:#E31D1A; color:white;",
          "rows": [
            {
              "cards":[
                {
                  "width":6,"component": {"name": "placeholder-card", settings: {"id": 0}}
                },
                {
                  "width":6,"component": {"name": "placeholder-card", settings: {"id": 1}}
                }
              ]
            }
          ]
        },
        {
          "containment":"fixed",
          "style":"background-color:#666666; color:white;",
          "rows":[
            {
              "cards":[
                {
                  "width":4,"component": {"name": "placeholder-card", settings: {"id": 2}}
                },
                {
                  "width":4,"component": {"name": "placeholder-card", settings: {"id": 3}}
                },
                {
                  "width":4,"component": {"name": "placeholder-card", settings: {"id": 4}}
                }
              ]
            },
            {
              "cards":[
                {
                  "width":6,"component": {"name": "placeholder-card", settings: {"id": 5}}
                },
                {
                  "width":6,"component": {"name": "placeholder-card", settings: {"id": 6}}
                }
              ]
            }

          ]
        },
        {
          "containment":"fixed",
          "style":"background-color:#FFFFCC ;color:#666666",
          "rows":[
            {
              "cards":[
                { "width":12,"component": {"name": "placeholder-card", settings: {"id": 7}} }
              ]
            }
          ]
        }
      ]
    };
  }
});
