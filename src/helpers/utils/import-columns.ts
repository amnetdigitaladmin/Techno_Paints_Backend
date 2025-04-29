class ImportColumns {
  admin = [       
    {display_name: "First Name",column_name: "first_name", is_optional: false}, 
    {display_name: "Last Name",column_name: "last_name", is_optional: false},  
    {display_name: "Email Id",column_name: "email", is_optional: false},
    {display_name: "Mobile Number",column_name: "mobile", is_optional: false},
    {display_name: "Address",column_name: "address", is_optional: true},
  ];

  business_partner = [       
    {display_name: "First Name",column_name: "first_name", is_optional: false}, 
    {display_name: "Last Name",column_name: "last_name", is_optional: false},  
    {display_name: "Email Id",column_name: "email", is_optional: false},
    {display_name: "Mobile Number",column_name: "mobile", is_optional: false},
    {display_name: "Address",column_name: "address", is_optional: true},
  ];

  client = [       
    {display_name: "Company",column_name: "company", is_optional: false},
    {display_name: "Email Id",column_name: "email", is_optional: false},
    {display_name: "Mobile Number",column_name: "mobile", is_optional: false},
    {display_name: "Address",column_name: "address", is_optional: true},
    {display_name: "Business Partner",column_name: "business_partner", is_optional: true},
    {display_name: "Contract Start Date",column_name: "contract_start_date", is_optional: true},
    {display_name: "Contract End Date",column_name: "contract_end_date", is_optional: true},
  ];
}
export default new ImportColumns()
