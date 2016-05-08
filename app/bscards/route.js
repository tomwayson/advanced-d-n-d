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
                  "width":6,"component": {"name": "placeholder-card"}
                },
                {
                  "width":6,"component": {"name": "placeholder-card"}
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
                  "width":4,"component": {"name": "placeholder-card"}
                },
                {
                  "width":4,"component": {"name": "placeholder-card"}
                },
                {
                  "width":4,"component": {"name": "placeholder-card"}
                }
              ]
            },
            {
              "cards":[
                {
                  "width":6,"component": {"name": "placeholder-card"}
                },
                {
                  "width":6,"component": {"name": "placeholder-card"}
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
                { "width":12,"component": {"name": "placeholder-card"} }
              ]
            }
          ]
        }
      ]
    };
  }
});
