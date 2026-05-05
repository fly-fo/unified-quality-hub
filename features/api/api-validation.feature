Feature: API validation scenarios
  As a team
  I want to validate API-level flows
  So that service behavior is covered consistently

  @api
  Scenario Outline: Validate <service_key> API case <case_no>
    Given a <service_key> API payload for case "<case_no>"
    When the <service_key> API request is processed
    Then the <service_key> API result should match the expected outcome for case "<case_no>"

    Examples:
      | case_no | service_key   |
      | 001     | transfers     |
      | 002     | transfers     |
      | 003     | transfers     |
      | 004     | transfers     |
      | 005     | transfers     |
      | 006     | transfers     |
      | 007     | transfers     |
      | 008     | transfers     |
      | 009     | transfers     |
      | 010     | transfers     |
      | 011     | transfers     |
      | 012     | transfers     |
      | 013     | transfers     |
      | 014     | transfers     |
      | 015     | transfers     |
      | 016     | transfers     |
      | 017     | transfers     |
      | 018     | transfers     |
      | 019     | transfers     |
      | 020     | transfers     |
      | 021     | transfers     |
      | 022     | transfers     |
      | 023     | transfers     |
      | 024     | transfers     |
      | 025     | transfers     |
      | 026     | transfers     |
      | 027     | transfers     |
      | 028     | transfers     |
      | 029     | transfers     |
      | 030     | transfers     |
      | 031     | transfers     |
      | 032     | transfers     |
      | 033     | transfers     |
      | 034     | transfers     |
      | 035     | beneficiaries |
      | 036     | beneficiaries |
      | 037     | beneficiaries |
      | 038     | beneficiaries |
      | 039     | beneficiaries |
      | 040     | beneficiaries |
      | 041     | beneficiaries |
      | 042     | beneficiaries |
      | 043     | beneficiaries |
      | 044     | beneficiaries |
      | 045     | beneficiaries |
      | 046     | beneficiaries |
      | 047     | beneficiaries |
      | 048     | beneficiaries |
      | 049     | beneficiaries |
      | 050     | beneficiaries |
      | 051     | beneficiaries |
      | 052     | beneficiaries |
      | 053     | beneficiaries |
      | 054     | beneficiaries |
      | 055     | beneficiaries |
      | 056     | beneficiaries |
      | 057     | beneficiaries |
      | 058     | beneficiaries |
      | 059     | beneficiaries |
      | 060     | beneficiaries |
      | 061     | beneficiaries |
      | 062     | beneficiaries |
      | 063     | beneficiaries |
      | 064     | cards         |
      | 065     | cards         |
      | 066     | cards         |
      | 067     | cards         |
      | 068     | cards         |
      | 069     | cards         |
      | 070     | cards         |
      | 071     | cards         |
      | 072     | cards         |
      | 073     | cards         |
      | 074     | cards         |
      | 075     | cards         |
      | 076     | cards         |
      | 077     | cards         |
      | 078     | cards         |
      | 079     | cards         |
      | 080     | cards         |
      | 081     | cards         |
      | 082     | statements    |
      | 083     | statements    |
      | 084     | statements    |
      | 085     | statements    |
      | 086     | statements    |
      | 087     | statements    |
      | 088     | statements    |
      | 089     | statements    |
      | 090     | statements    |
      | 091     | statements    |
      | 092     | statements    |
      | 093     | statements    |
      | 094     | statements    |
      | 095     | statements    |
      | 096     | statements    |
      | 097     | statements    |
      | 098     | statements    |
      | 099     | statements    |
      | 100     | statements    |