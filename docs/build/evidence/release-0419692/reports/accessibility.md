# Accessibility release proof

Release SHA: `04196921264d9897e8e547a8e0a2cef1ad43f8fb`  
Target: WCAG 2.2 AA  
Result: PASS

Lighthouse accessibility scored 1.00 on the deployed mobile surface. The browser accessibility tree exposed one labeled radio group, labeled required name and email controls, a single primary action, programmatically associated validation output, status regions, and a labeled confirmation region.

Manual keyboard proof covered service selection, form entry, invalid submission, submission, clear, and rebook. Invalid submission focused the email control; the controlled submitting state was busy and disabled; successful submission focused `#confirmation`; storage failure focused `#status`; revisit focused the confirmation; clear returned focus to the service radio. Visible focus and text/background contrast were inspected on the rendered surfaces. No critical automated accessibility violation was found.
