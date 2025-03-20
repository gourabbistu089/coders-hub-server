
# DevTinder API

## authRouter
- POST /signup
- POST /signin
- POST /logout

## profileRouter
- GET /profile/view
- PATCH /profile / edit
- PATCH /profile/password


##### Status: ignore, interested,accepted, rejected

## connnectionRequestRouter
- POST/ request/send/interest/:userId
- POST/ request/send/ignore/:userId
- POST/ request/review/accepted/:userId
- POST/ request/review/reject/:userId

## userConnectionRouter
- GET /user/ connections
- GET / user/ requests/
- GET / user/feed - get you the profile of other user on platform


## Notes

/feed/?page=1&limit=10 => .skip(0) & .limit(10) -- first 10 users => first 10 users 1 - 10

/feed/?page=2&limit=10 => .skip(10) & .limit(10) -- next 10 users 11 - 20 

/feed/?page=3&limit=10 =>  .skip(20) & .limit(10) -- next 10 users 21 - 30

skip = (page - 1) * limit

