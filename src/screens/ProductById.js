import { StyleSheet, Text, View, ScrollView, Image, SafeAreaView } from 'react-native'
import React from 'react'
import StarRatingDisplay from 'react-native-star-rating-widget'

const ProductById = ({ route }) => {
    const { product } = route.params;
    console.log(product);
  // Fallback for image
  const imageUrl =
    product.images && Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : product.thumbnail;

  // Helper for tags
  const tagsArray = Array.isArray(product.tags) ? product.tags : [];
  // Helper for dimensions
  const dimensions =
    product.width && product.height && product.depth
      ? `${product.width} x ${product.height} x ${product.depth}`
      : '';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.card}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Container with light gray bg, no border radius at the top */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
        {/* Title */}
        <Text style={styles.title}>{product.title}</Text>

        {/* Product Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Product Details</Text>
          <Text style={styles.sectionLabel}>Brand:</Text>
          <Text style={styles.sectionValue}>{product.brand}</Text>
          <Text style={styles.sectionLabel}>Category:</Text>
          <Text style={styles.sectionValue}>{product.category}</Text>
          <Text style={styles.sectionLabel}>Description:</Text>
          <Text style={styles.sectionValue}>{product.description}</Text>
        </View>

        {/* Pricing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Pricing</Text>
          <Text style={styles.sectionLabel}>Price:</Text>
          <Text style={styles.priceValue}>${product.price}</Text>
          <Text style={styles.sectionLabel}>Discount Percentage:</Text>
          <Text style={styles.sectionValue}>{product.discountPercentage}%</Text>
        </View>

        {/* Rating & Stock Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Rating & Stock</Text>
          <Text style={styles.sectionLabel}>Rating:</Text>
          <View style={styles.ratingPill}>
            <Text style={styles.ratingText}>{product.rating}</Text>
            <StarRatingDisplay rating={product.rating} starSize={14} color="green" />
          </View>
          <Text style={styles.sectionLabel}>Stock:</Text>
          <Text style={styles.sectionValue}>{product.stock}</Text>
          <Text style={styles.sectionLabel}>Availability Status:</Text>
          <Text style={styles.sectionValue}>{product.availabilityStatus}</Text>
        </View>

        {/* Tags Section */}
        {tagsArray.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Tags</Text>
            <View style={styles.tagsContainer}>
              {tagsArray.map((tag, idx) => (
                <Text key={idx} style={styles.tagChip}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Dimensions & Shipping */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Shipping & Specs</Text>
          {dimensions ? (
            <>
              <Text style={styles.sectionLabel}>Dimensions:</Text>
              <Text style={styles.sectionValue}>{dimensions}</Text>
            </>
          ) : null}
          <Text style={styles.sectionLabel}>Shipping Information:</Text>
          <Text style={styles.sectionValue}>{product.shippingInformation}</Text>
        </View>

        {/* Order/Return/Warranty Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Order & Warranty</Text>
          <Text style={styles.sectionLabel}>Minimum Order Quantity:</Text>
          <Text style={styles.sectionValue}>
            {product.minimumOrderQuantity}
          </Text>
          <Text style={styles.sectionLabel}>Return Policy:</Text>
          <Text style={styles.sectionValue}>{product.returnPolicy}</Text>
          <Text style={styles.sectionLabel}>Warranty Information:</Text>
          <Text style={styles.sectionValue}>{product.warrantyInformation}</Text>
     
        </View>

        {/* Customer Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Customer Reviews</Text>
          {Array.isArray(product.reviews) && product.reviews.length > 0 ? (
            product.reviews.map((review, idx) => (
              <View key={idx} style={styles.reviewContainer}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                  <Text style={[styles.ratingText, { marginLeft: 8 }]}>{review.rating}</Text>
                  <View style={{ marginLeft: 8 }}>
                    <StarRatingDisplay rating={review.rating} starSize={14} color="green" />
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.sectionValue}>No reviews yet.</Text>
          )}
        </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default ProductById

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 10,
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 20,
  },
  imageContainer: {
   
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    overflow: 'hidden',
    marginBottom: 18,
  },
  productImage: {
    width: '100%',
    height: 300,
   // backgroundColor: '#eee',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    backgroundColor: '#FFF4E5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    fontWeight: '900',
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    color: '#555',
  },
  sectionValue: {
    fontSize: 15,
    marginTop: 2,
    color: '#333',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E53935',
    marginTop: 2,
    marginBottom: 2,
  },
  ratingPill: {
   // backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 15,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginBottom: 2,
  },
  tagChip: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    fontSize: 13,
    margin: 4,
    color: '#444',
  },
  reviewContainer: {
    marginBottom: 18,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111',
  },
  reviewComment: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
})