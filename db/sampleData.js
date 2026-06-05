const users = [
  {
    _id: "1",
    first_name: "Annie",
    last_name: "Lee",
    location: "Hanoi",
    description: "Street photographer",
    occupation: "Designer",
    login_name: "annie",
    password: "annie123",
  },
  {
    _id: "2",
    first_name: "Bao",
    last_name: "Tran",
    location: "Da Nang",
    description: "Travel and nature fan",
    occupation: "Engineer",
    login_name: "bao",
    password: "bao123",
  },
  {
    _id: "3",
    first_name: "Chi",
    last_name: "Nguyen",
    location: "HCMC",
    description: "Food and city snapshots",
    occupation: "Teacher",
    login_name: "chi",
    password: "chi123",
  },
];

const photos = [
  {
    _id: "101",
    user_id: "1",
    file_name: "sample-1.jpg",
    date_time: new Date("2026-01-10T09:10:00Z"),
    comments: [
      {
        _id: "201",
        comment: "Great shot!",
        date_time: new Date("2026-01-10T11:15:00Z"),
        user_id: "2",
      },
      {
        _id: "202",
        comment: "Love the colors.",
        date_time: new Date("2026-01-10T12:30:00Z"),
        user_id: "3",
      },
    ],
  },
  {
    _id: "102",
    user_id: "2",
    file_name: "sample-2.jpg",
    date_time: new Date("2026-01-20T10:00:00Z"),
    comments: [
      {
        _id: "203",
        comment: "Nice composition.",
        date_time: new Date("2026-01-20T12:00:00Z"),
        user_id: "1",
      },
    ],
  },
];

module.exports = { users, photos };
