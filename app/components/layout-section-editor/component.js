import Ember from 'ember';

export default Ember.Component.extend({
  tagName:'section',
  classNames:['layout-section-editor'],
  containerClass: Ember.computed('model.containment', function(){
    let containment = this.get('model.containment');
    return ( containment === 'fixed') ? 'container' : 'container-fluid';
  }),
  /**
   * Get the event bus
   */
  eventBus: Ember.inject.service('event-bus'),

});
