# AI/ML AI Space Writeup

---

## Description

You are assigned the important mission of locating and identifying the infamous space hacker. Your investigation begins by analyzing the data patterns and breach points identified in the latest cyber-attacks. Use the provided coordinates of the last known signal origins to narrow down his potential hideouts. Utilize advanced tracking algorithms to follow the digital footprint left by the hacker.

---

# Knowledge

**Distance matrices** encode pairwise distances between points. 
When analyzed correctly with dimensionality‑reduction algorithms, these distances can be interpreted as coordinates that reproduce the underlying spatial pattern.

To reconstruct the original structure hidden inside the matrix we require:

- A valid **distance matrix**
    
- A **dimensionality reduction method** capable of handling precomputed distances
    
- Post‑processing to **rotate**, **align**, and **visualize** the revealed structure
    

---

## Dimensionality Reduction Tools Used

Two main algorithms were needed:

- **MDS (Multidimensional Scaling)**  
    Reconstructs point positions based solely on distances.
    
- **PCA (Principal Component Analysis)**  
    Rotates and aligns reconstructed points along principal axes.
    

Both contribute to converting the raw matrix into readable structure.

---

# Provided Input Data

The challenge included one file:

```
distance_matrix.npy
```

This file contained a **1808 × 1808** symmetric distance matrix with zeros on the diagonal and no missing values.

---

## npy file analysis

- The matrix encodes **pairwise distances of points in an unknown 2D space**.
    
- If reconstructed correctly, the shape forms **letters**, which together reveal the hidden flag.
    
- Noise and orientation distort the message unless corrected.
    

Key observations:

- Distances were consistent and clean.
    
- A strong concentration of small distances implied clusters forming characters.
    
- The hacker relied on geometric reconstruction to hide his signal.
    

---

# Exploitation Logic

To reveal the hidden flag:

1. **Load the distance matrix**  
    This restores the full pairwise relationship between all encoded points.
    
2. **Use MDS to reconstruct 2D coordinates**  
    MDS converts distances → positions while roughly preserving spatial relationships.
    
3. **Center and rotate the result using PCA**  
    PCA aligns the cloud of points to remove skew and random rotation, making the lettering upright.
    
4. **Flip axes if necessary**  
    Dimensionality‑reduction can mirror results; flipping restores correct orientation.
    
5. **Plot using small markers**  
    Ensures characters are crisp and easily readable.
    

After this cleaning, a clear handwritten‑style string appears.

---

# Code Used

Only the essential steps required to reconstruct and clean the hidden string:

```python
#imports
import numpy as np
import matplotlib.pyplot as plt
from sklearn.manifold import MDS
from sklearn.decomposition import PCA
import os

# Load distance matrix
fn = "distance_matrix.npy"
assert os.path.exists(fn), f"{fn} not found"
D = np.load(fn)
print("Matrix shape:", D.shape)

# Check matrix properties
print("dtype:", D.dtype)
print("min, max, mean:", np.nanmin(D), np.nanmax(D), np.nanmean(D))
print("Diagonal (first 10):", np.diag(D)[:10])
print("Symmetry check:", np.nanmax(np.abs(D - D.T)))
print("Any NaN or inf:", np.isnan(D).any(), np.isinf(D).any())

# Multidimensional Scaling (MDS)
mds = MDS(n_components=2, dissimilarity='precomputed', random_state=0, n_init=4, max_iter=300)
coords = mds.fit_transform(D)

# Plot
plt.figure(figsize=(7,5))
plt.scatter(coords[:,0], coords[:,1], s=6)
plt.title("MDS 2D projection")
plt.show()

# Center and rotate points using PCA
coords_centered = coords - coords.mean(0)
coords_pca = PCA(n_components=2).fit_transform(coords_centered)

# Plot rotated
plt.figure(figsize=(7,5))
plt.scatter(coords_pca[:,0], coords_pca[:,1], s=6)
plt.axis('equal')
plt.title("PCA-aligned projection")
plt.show()

# Flip Y-axis for readability
coords_pca[:,1] *= -1

plt.figure(figsize=(7,5))
plt.scatter(coords_pca[:,0], coords_pca[:,1], s=6)
plt.axis('equal')
plt.title("Corrected orientation")
plt.show()

#Final Clean Plot
plt.figure(figsize=(8,6))
plt.plot(coords_pca[:,0], coords_pca[:,1], '.', ms=3)
plt.axis('equal')
plt.title("Final readable flag")
plt.show()


```

This pipeline converts the hacker’s distance signature back into readable text.

---

# Step-by-Step Reconstruction

1. **MDS projection**  
    Reveals a rough outline of characters hidden within point clusters.
    
2. **PCA alignment**  
    Fixes rotation and centralizes the structure.
    
3. **Axis flip**  
    Corrects the final orientation.
    
4. **Fine plotting**  
    Makes the flag fully legible.
    

---

# Final Step — Retrieve the Flag

The plotted reconstruction clearly reveals:

![space](https://gianlucabassani.github.io/assets/ctf/space.jpg)

```
HTB{d1st4nt_spac3}
```