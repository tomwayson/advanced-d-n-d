import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['resizer'],
  attributeBindings:['style'],

  style:Ember.computed('model.position', function(){
    let pos = this.get('model.position');
    if(pos){
      return Ember.String.htmlSafe('top:' + pos.top + 'px; height:' + pos.height + 'px;left:' + pos.left + 'px;');
    }else{
      return Ember.String.htmlSafe('');
    }
  }),
  // DRAG OF RESIZER
  //
  // This is problematic as other event handlers are interfering
  //
  // state: {
  //   isDragging: false
  // },
  // mouseDown(event){
  //   console.log('Resizer Mouse Down X:' + event.clientX);
  //   this.state.isDragging = true;
  // },
  // mouseUp(event){
  //   console.log('Resizer Mouse Up X:' + event.clientX);
  //   this.state.isDragging = false;
  // },
  // mouseMove(event){
  //   if(this.state.isDragging){
  //     console.log('Dragging Resizer: X:' + event.clientX);
  //     this.set('model.position.left', event.clientX - 10);
  //     this.$().css({'left': event.clientX - 10});
  //   }else{
  //     //console.log('Resizer mousemove');
  //   }
  // },
  // mouseLeave(event){
  //   console.log('resizer mouseLeave');
  //   if(this.state.isDragging){
  //     this.state.isDragging = false;
  //   }
  //
  // },

  actions: {
    shiftRight(){
      console.log('Shift Splitter to the right...');
      this.sendAction('onShift', this.get('model.cardIndex'), this.get('model.edge'),"right");
    },
    shiftLeft(){
      console.log('Shift Splitter to the left...');
      this.sendAction('onShift', this.get('model.cardIndex'), this.get('model.edge'),'left');
    }

  }



});
