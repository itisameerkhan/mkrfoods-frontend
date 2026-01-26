import "./Comparison.scss";

const Comparison = () => {
  const features = [
    { name: "Halal ingredients", mkr: true, others: false },
    { name: "Made with good quality oil", mkr: true, others: false },
    { name: "No artificial colors", mkr: true, others: false },
    { name: "No artificial preservatives", mkr: true, others: false },
    { name: "Homemade-style preparation", mkr: true, others: false },
    { name: "Authentic Indian recipes", mkr: true, others: false },
    { name: "Small-batch freshness", mkr: true, others: false },
    { name: "Clean & honest ingredients", mkr: true, others: false },
  ];

  return (
    <section className="comparison-section">
      <div className="comparison-container">
        <div className="image-side">
          <img 
            src="https://res.cloudinary.com/dnyehgbeu/image/upload/v1769411104/mkrfoods/Gemini_Generated_Image_2cplys2cplys2cpl_sjgloy.png" 
            alt="MKR Foods Product" 
          />
        </div>
        <div className="content-side">
          <h2 className="comparison-title">See the difference.</h2>
          
          <div className="comparison-table">
            <div className="table-header">
              <div className="col-benefit">Benefits</div>
              <div className="col-brand">MKR Foods</div>
              <div className="col-competitor">Others</div>
            </div>
            
            <div className="table-body">
              {features.map((feature, index) => (
                <div key={index} className="table-row">
                  <div className="col-benefit">{feature.name}</div>
                  <div className="col-brand">
                    {feature.mkr ? (
                      <div className="check-box">
                        <i className="fa-solid fa-check"></i>
                      </div>
                    ) : (
                      <i className="fa-solid fa-xmark cross-icon"></i>
                    )}
                  </div>
                  <div className="col-competitor">
                    {feature.others ? (
                      <div className="check-box">
                        <i className="fa-solid fa-check"></i>
                      </div>
                    ) : (
                      <i className="fa-solid fa-xmark cross-icon"></i>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
