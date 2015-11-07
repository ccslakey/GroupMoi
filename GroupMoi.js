Groups = new Mongo.Collection("groups");


if (Meteor.isClient) {
  // do some clienty stuff
  Meteor.subscribe("groups");

  Template.body.helpers({
      groups: function () {
          // Find all groups and list the newest groups first
          return Groups.find({}, {sort: {createdAt: -1}});
      }
  });

// end of client
}

if (Meteor.isServer) {
    // Specify which collections are sent to the client
    Meteor.publish("groups", function () {
        return Groups.find({
            owner: this.userId
        });
    });

// end of server
}