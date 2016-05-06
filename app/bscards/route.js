import Ember from 'ember';

export default Ember.Route.extend({
  model(){
    //return a stack of cards
    return {
      "sections": [
        {
          "rows": []
        },
        {
          "rows":[
            {
              "cards":[
                {
                  "width":4,
                  "height": 4,
                  "component": {"name": "placeholder-card"}
                },
                {
                  "width":4,
                  "height": 4,
                  "component": {"name": "placeholder-card"}
                },
                {
                  "width":4,
                  "height": 4,
                  "component": {"name": "placeholder-card"}
                }
              ]
            },
            {
              "cards":[
                {
                  "width":6,
                  "height": 4,
                  "component": {"name": "placeholder-card"}
                },
                {
                  "width":6,
                  "height": 4,
                  "component": {"name": "placeholder-card"}
                }
              ]
            },
            {
              "cards":[
                {
                  "width":12,
                  "height": 4,
                  "component": {"name": "placeholder-card"}
                }
              ]
            }
          ]
        }
      ]
    };
  }
});
