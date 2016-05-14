import Ember from 'ember';

export default Ember.Controller.extend({

  // this is just used to verify that we're adding new cards
  _lastPlaceHolderCardId: 100,

  layoutCoordinator: Ember.inject.service('layout-coordinator'),


  swatches:Ember.computed('model', function(){
    //return a collection of swatch objects
    return [
      {
        text:'DEBUG',
        dragType:'card',
        defaults: {
          "component": {
            "name": "debug-card"
          }
        }
      },
      {
        text:'PLACEHOLDER',
        dragType:'card',
        defaults: {
          "component": {
            "name": "placeholder-card"
          }
        }
      },
      {
        text:'Add Section',
        dragType:'section'
      }
    ];
  }),

  getCardDefaults(cardType) {
    if (cardType === 'placeholder') {
      // increment placeholder id
      this.set('_lastPlaceHolderCardId', this.get('_lastPlaceHolderCardId') + 1);
      return {
        component: {
          name: 'placeholder-card',
          settings: {
            id: this.get('_lastPlaceHolderCardId')
          }
        }
      };
    // TODO: handle other card types
    } else if (cardType = 'blank') {
      return {
        component: {
          name: 'blank-card'
        }
      };
    } else {
    // TODO: what to do here
    return null;
    }
  },

  actions: {
    onCardDragStart(cardType) {
      const cardModel = this.getCardDefaults(cardType);
      this.get('layoutCoordinator').set('transferData.model', cardModel);
    },
    onSectionDragStart() {
      const sectionModel = {
        containment: 'fixed',
        style: 'background-color: blue; color:white;',
        rows: []
      };
      this.get('layoutCoordinator').set('transferData.model', sectionModel);
    }
  }
});
