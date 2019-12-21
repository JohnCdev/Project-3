const db = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  requestFriend: (req, res) => {
    const requestData = JSON.parse(JSON.stringify(req.body));
    jwt.verify(req.token, "secretkey", (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        db.Profile.find({ userName: req.body.receiver }).then(result => {
          //if the other user has already sent a request to the client w/o the client knowing...
          if (result[0].sentFriendRequests.includes(req.body.sender)) {
            const newFriendList = [...result[0].friendList, req.body.sender];
            const newSentRequests = result[0].sentFriendRequests.filter(
              request => request !== req.body.sender
            );
            db.Profile.findOneAndUpdate(
              { userName: req.body.receiver },
              {
                $set: {
                  sentFriendRequests: newSentRequests,
                  friendList: newFriendList
                }
              }
            ).then(
              db.Profile.find({ userName: req.body.sender }).then(result => {
                const friendList = [...result[0].friendList, req.body.receiver];
                const sentFriendRequests = result[0].sentFriendRequests;
                const receivedFriendRequests = result[0].receivedFriendRequests.filter(
                  request => request !== req.body.receiver
                );
                db.Profile.findOneAndUpdate(
                  { userName: req.body.sender },
                  {
                    $set: {
                      receivedFriendRequests: receivedFriendRequests,
                      friendList: friendList
                    }
                  }
                ).then(result => {
                  res.json({
                    sentFriendRequests,
                    friendList,
                    receivedFriendRequests
                  });
                });
              })
            );
          } else {
            //otherwise simply push to the arrays and send the new sentRequests array back to client
            db.Profile.findOneAndUpdate(
              { userName: req.body.receiver },
              { $push: { receivedFriendRequests: req.body.sender } }
            ).then(result => {
              db.Profile.findOneAndUpdate(
                { userName: req.body.sender },
                { $push: { sentFriendRequests: req.body.receiver } },
                { new: true }
              ).then(result => {
                res.json({
                  receivedFriendRequests: result.receivedFriendRequests,
                  friendList: result.friendList,
                  sentFriendRequests: result.sentFriendRequests
                });
              });
            });
          }
        });
      }
    });
  },
  removeFriend: (req, res) => {
    jwt.verify(req.token, "secretkey", (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        const requester = req.body.sender;
        console.log(req.body);
        const accepter = req.body.receiver;

        db.Profile.find({ userName: accepter }).then(result => {
          const newFriendList = result[0].friendList.filter(
            friend => friend !== requester
          );
          db.Profile.findOneAndUpdate(
            { userName: accepter },
            { $set: { friendList: newFriendList } }
          ).then(result => {
            db.Profile.find({ userName: requester }).then(result => {
              console.log(result[0].friendList);
              const friendList = result[0].friendList.filter(
                friend => friend !== accepter
              );
              console.log(friendList);
              db.Profile.findOneAndUpdate(
                { userName: requester },
                {
                  $set: {
                    friendList: result[0].friendList.filter(
                      friend => friend !== accepter
                    )
                  }
                }
              ).then(result => {
                const receivedFriendRequests = result.receivedFriendRequests.filter(
                  request => request !== accepter
                );
                const sentFriendRequests = result.sentFriendRequests;
                res.json({
                  receivedFriendRequests,
                  friendList,
                  sentFriendRequests
                });
              });
            });
          });
        });
      }
    });
  },
  acceptFriend: (req, res) => {
    const accepter = req.body.sender;
    const requester = req.body.receiver;
    jwt.verify(req.token, "secretkey", (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        db.Profile.find({ userName: requester }).then(result => {
          const oldFriendRequests = result[0].sentFriendRequests;
          const newFriendRequests = oldFriendRequests.filter(
            request => request !== accepter
          );
          db.Profile.findOneAndUpdate(
            { userName: requester },
            { $push: { friendList: accepter } },
            { $set: { sentFriendRequests: newFriendRequests } }
          ).then(result => {
            db.Profile.find({ userName: accepter }).then(result => {
              const oldFriendRequests = result[0].receivedFriendRequests;
              const receivedFriendRequests = oldFriendRequests.filter(
                request => request !== requester
              );
              const friendList = [...result[0].friendList, requester];
              const sentFriendRequests = [...result[0].sentFriendRequests];
              db.Profile.findOneAndUpdate(
                { userName: accepter },
                { $set: { friendList: friendList } },
                { $set: { receivedFriendRequests: receivedFriendRequests } }
              ).then(result =>
                res.json({
                  receivedFriendRequests,
                  friendList,
                  sentFriendRequests
                })
              );
            });
          });
        });
      }
    });
  },
  getUserProfile: (req, res) => {
    console.log(req.params.profile);
    db.Profile.find({ userName: req.params.profile }).then(data =>
      res.json({ data })
    );
  },
  getProfile: (req, res) => {
    db.Profile.find({ userName: req.body.userName }).then(data =>
      res.json({ data })
    );
  },
  updateProfile: (req, res) => {
    db.Profile.updateOne(
      { userName: req.body.userName },
      {
        $set: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          age: req.body.age,
          currentCity: req.body.currentCity,
          lastUpdated: req.body.lastUpdated
        }
      }
    )
      .then(data => res.json({ data }))
      .catch(err => console.log(err));
  }
};