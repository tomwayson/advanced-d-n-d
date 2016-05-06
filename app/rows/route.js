import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return {
      // TODO: this won't work if you start w/ an empty array, why????
      rows: Ember.A([
        {
          message: 'This is a preexisting row',
          cards: [],
          style: {}
        }
      ])
    };
  }
});
