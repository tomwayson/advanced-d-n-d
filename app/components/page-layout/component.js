import Ember from 'ember';

export default Ember.Component.extend({
  hasSections: Ember.computed('model.sections.length', function() {
    return this.get('model.sections.length') > 0;
  }),
});
