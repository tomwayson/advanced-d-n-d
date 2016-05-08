import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames:['draggable'],
  attributeBindings:['draggable'],
  draggable:true,
  objectType: 'card',
  action:'add-card',
  eventBus: Ember.inject.service('event-bus'),

  dragStart(event){
    console.log('DRAGGABLE-OBJECT Start for  ' + this.get('objectType'));
    //set the type
    //event.dataTransfer.setData('text/plain', this.get('dragType'));
    this.set('eventBus.transferData', {
      objectType:this.get('objectType'),
      action:this.get('action'),
      component: {
        "name":"placeholder-card"
      }
    });


  },



});
