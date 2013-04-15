# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

ldl = Metric.create(name: 'LDL', unit: 'mg/dl')
hdl = Metric.create(name: 'HDL', unit: 'mg/dl')
trig = Metric.create(name: 'Triglycerides', unit: 'mg/dl')
sleep = Metric.create(name: 'Sleep', unit: 'hours/night')

submitter = User.create(full_name: 'Dr. Defacto', email: 'drdefacto@defactomd.com')

submission = Submission.create(user: submitter, message: 'Hello world of hGraph!')

Contribution.create(submission: submission, metric: ldl, age: 40, gender: 'male', weight: 5, healthy_min: 0, healthy_max: 130, total_min: 0, total_max: 160)
Contribution.create(submission: submission, metric: hdl, age: 40, gender: 'male', weight: 5, healthy_min: 50, healthy_max: 60, total_min: 0, total_max: 60)
Contribution.create(submission: submission, metric: trig, age: 40, gender: 'male', weight: 5, healthy_min: 0, healthy_max: 150, total_min: 0, total_max: 600)
Contribution.create(submission: submission, metric: sleep, age: 40, gender: 'male', weight: 5, healthy_min: 7, healthy_max: 10, total_min: 0, total_max: 18)


Contribution.create(submission: submission, metric: ldl, age: 40, gender: 'female', weight: 5, healthy_min: 0, healthy_max: 100, total_min: 0, total_max: 160)
Contribution.create(submission: submission, metric: hdl, age: 40, gender: 'female', weight: 5, healthy_min: 40, healthy_max: 60, total_min: 0, total_max: 60)
Contribution.create(submission: submission, metric: trig, age: 40, gender: 'female', weight: 5, healthy_min: 0, healthy_max: 150, total_min: 0, total_max: 600)
Contribution.create(submission: submission, metric: sleep, age: 40, gender: 'female', weight: 5, healthy_min: 7, healthy_max: 10, total_min: 0, total_max: 18)

