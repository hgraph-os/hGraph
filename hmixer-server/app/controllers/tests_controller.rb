class TestsController < ApplicationController
  def metrics
    @submissions = Submission.all(:include => [:user, :contributions])

    respond_to do |format|
      format.html
      format.json
    end

  end
end
