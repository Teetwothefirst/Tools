# Wrap the code in a function
def baymax():
    
    # Create a list:
    symptoms = ["Fever", "Cold", "Fracture", "Headache", "Nausea", 
    "Vomiting", "Diarrhea", "Constipation", "Fatigue", "Dizziness", 
    "Shortness of breath", "Chest pain", "Abdominal pain", "Back pain", 
    "Joint pain", "Muscle pain", "Skin rash", "Swelling", "Bruising", 
    "Bleeding", "Vision problems", "Hearing problems", "Speech problems", 
    "Memory problems", "Confusion", "Anxiety", "Depression", "Irritability", 
    "Mood swings", "Sleep problems", "Appetite changes", "Weight changes", 
    "Thirst changes", "Urination changes", "Bowel changes", "Skin changes", 
    "Hair changes", "Nail changes", "Mouth changes", "Eye changes", "Ear changes",
    "Nose changes", "Throat changes", "Lung changes", "Heart changes", "Stomach changes",
    "Intestine changes", "Liver changes", "Kidney changes", "Bladder changes", 
    "Reproductive changes", "Hormone changes", "Blood changes", 
    "Immune system changes", "Nervous system changes", "Brain changes", "Spinal cord changes", 
    "Nerve changes", "Muscle changes", "Bone changes", "Joint changes", "Skin changes", 
    "Hair changes", "Nail changes", "Mouth changes", "Eye changes", "Ear changes", "Nose changes", 
    "Throat changes", "Lung changes", "Heart changes", "Stomach changes", "Intestine changes", "Liver changes", "Kidney changes", "Bladder changes", "Reproductive changes", 
    "Hormone changes", "Blood changes", "Immune system changes", "Nervous system changes", "Brain changes", "Spinal cord changes", "Nerve changes", "Muscle changes", 
    "Bone changes", "Joint changes", "Skin changes", "Hair changes", "Nail changes", "Mouth changes", "Eye changes", "Ear changes", "Nose changes", "Throat changes", "Lung changes", "Heart changes", 
    "Stomach changes", "Intestine changes", "Liver changes", "Kidney changes", 
    "Bladder changes", "Reproductive changes", "Hormone changes", 
    "Blood changes", "Immune system changes", "Nervous system changes", 
    "Brain changes", "Spinal cord changes", "Nerve changes", "Muscle changes", 
    "Bone changes", "Joint changes", "Skin changes", "Hair changes", 
    "Nail changes", "Mouth changes", "Eye changes", "Ear changes", 
    "Nose changes", "Throat changes", "Lung changes", "Heart changes", 
    "Stomach changes", "Intestine changes", "Liver changes", "Kidney changes",
    "Bladder changes", "Reproductive changes", "Hormone changes", 
    "Blood changes", "Immune system changes", "Nervous system changes", "Brain changes", "Spinal cord changes", "Nerve changes", "Muscle changes", "Bone changes", "Joint changes", "Skin changes", "Hair changes", "Nail changes", "Mouth changes", "Eye changes", "Ear changes", "Nose changes", "Throat changes", "Lung changes", "Heart changes", "Stomach changes", "Intestine changes", "Liver changes",
    "Kidney changes", "Bladder changes", "Reproductive changes", 
    "Hormone changes", "Blood changes", "Immune system changes", 
    "Nervous system changes", "Brain changes", "Spinal cord changes", 
    "Nerve changes", "Muscle changes", "Bone changes", "Joint changes", 
    "Skin changes", "Hair changes", "Nail changes", "Mouth changes", 
    "Eye changes", "Ear changes", "Nose changes", "Throat changes", 
    "Lung changes", "Heart changes", "Stomach changes", "Intestine changes",
    "Liver changes", "Kidney changes", "Bladder changes",
    "Reproductive changes", "Hormone changes", "Blood changes", 
    "Immune system changes", "Nervous system changes", 
    "Brain changes", "Spinal cord changes", "Nerve changes", 
    "Muscle changes", "Bone changes", "Joint changes", "Skin changes",
    "Hair changes", "Nail changes", "Mouth changes", "Eye changes", 
    "Ear changes", "Nose changes", "Throat changes", "Lung changes", 
    "Heart changes", "Stomach changes", "Intestine changes", 
    "Liver changes", "Kidney changes", "Bladder changes", "Reproductive changes", 
    "Hormone changes", "Blood changes", "Immune system changes", 
    "Nervous system changes", "Brain changes", "Spinal cord changes", 
    "Nerve changes", "Muscle changes", "Bone changes", "Joint changes",
    "Skin changes", "Hair changes", "Nail changes", "Mouth changes", 
    "Eye changes", "Ear changes", "Nose changes", "Throat changes", 
    "Lung changes", "Heart changes", "Stomach changes", "Intestine changes",
    "Liver changes", "Kidney changes", "Bladder changes", 
    "Reproductive changes", "Hormone changes", "Blood changes", 
    "Immune system changes", "Nervous system changes", "Brain changes", 
    "Spinal cord changes", "Nerve changes", "Muscle changes",
    "Bone changes", "Joint changes", "Skin changes", "Hair changes",
    "Nail changes", "Mouth changes", "Eye changes", "Ear changes", 
    "Nose changes", "Throat changes", "Lung changes", "Heart changes", 
    "Stomach changes", "Intestine changes", "Liver changes", 
    "Kidney changes", "Bladder changes", "Reproductive changes", 
    "Hormone changes", "Blood changes", "Immune system changes", 
    "Nervous system changes", "Brain changes", "Spinal cord changes",
    "Nerve changes", "Muscle changes", "Bone changes", "Joint changes", 
    "Skin changes", "Hair changes", "Nail changes", "Mouth changes", 
    "Eye changes", "Ear changes", "Nose changes", "Throat changes", 
    "Lung changes", "Heart changes", "Stomach changes", 
    "Intestine changes", "Liver changes", "Kidney changes", 
    "Bladder changes", "Reproductive changes", "Hormone changes", 
    "Blood changes", "Immune system changes", "Nervous system changes", "Brain changes", 
    "Spinal cord changes", "Nerve changes", "Muscle changes", "Bone changes", "Joint changes", 
    "Skin changes", "Hair changes", "Nail changes", "Mouth changes", "Eye changes", "Ear changes", 
    "Nose changes", "Throat changes", "Lung changes", "Heart changes", "Stomach changes", 
    "Intestine changes", "Liver changes", "Kidney changes", "Bladder changes", 
    "Reproductive changes", "Hormone changes", "Blood changes", 
    "Immune system changes", "Nervous system changes", "Brain changes", 
    "Spinal cord changes", "Nerve changes", "Muscle changes", "Bone changes",
    "Joint changes"]

    symptom_name = input("Please enter your symptom: ")

    symptom_found = False
    for symptom in symptoms:
        if symptom_name.lower().strip() == symptom.lower().strip():
            print("Symptom found: " + symptom.strip())
            symptom_found = True
            break
            
    if not symptom_found:
        print("Symptom not found.")

baymax()