async function testFDA() {
  const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"metformin"&limit=1`;
  console.log("Fetching openFDA data for Metformin...");
  
  try {
    const res = await fetch(url);
    const data = await res.json() as any;
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      console.log("Keys returned by openFDA label endpoint:");
      console.log(Object.keys(result).slice(0, 15));
      
      console.log("\nSample generic name from openfda property:");
      console.log(result.openfda?.generic_name);
      
      console.log("\nSample brand name from openfda property:");
      console.log(result.openfda?.brand_name);
      
      console.log("\nSample indications_and_usage:");
      console.log(result.indications_and_usage?.slice(0, 200) + "...");

      console.log("\nSample adverse_reactions:");
      console.log(result.adverse_reactions?.slice(0, 200) + "...");
    } else {
      console.log("No results found.");
    }
  } catch (err: any) {
    console.error("Error fetching from openFDA:", err.message);
  }
}

testFDA();
