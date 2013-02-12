module TestsHelper
  def submission_to_hmixer(submission)
    @contributions_male = submission.contributions.where(:gender => "male", :include => :metric)
    @contributions_female = submission.contributions.where(:gender => "female", :include => :metric)
    
    @metrics_male = @contributions_male.map{|c| {:name => c.metric.name, :features => 
        {:healthyrange => [c.healthy_min,c.healthy_max], :totalrange => [c.total_min,c.total_max], 
        :boundayflags => [false,true], :weight => c.weight, :unitlabel => c.metric.unit} } }

    @metrics_female = @contributions_female.map{|c| {:name => c.metric.name, :features => 
        {:healthyrange => [c.healthy_min,c.healthy_max], :totalrange => [c.total_min,c.total_max], 
        :boundayflags => [false,true], :weight => c.weight, :unitlabel => c.metric.unit} } }
    
    male = { :gender => "male", :metrics => @metrics_male }
    female = { :gender => "female", :metrics => @metrics_female }

    hmixer = [male, female]

    return hmixer
  end

end
