class TestsController < ApplicationController
  def metrics
    @submissions = Submission.all
  end
end
